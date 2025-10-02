import mbxClient from '@mapbox/mapbox-sdk';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';

export interface GeocodedAddress {
  formatted: string;
  lat: number;
  lng: number;
}

export interface CommuteResult {
  destination: string;
  duration: number;
  distance: number;
}

export interface LocationComparison {
  optionId: string;
  label: string;
  address: GeocodedAddress;
  commuteToHome?: CommuteResult;
  commuteToPlaces: CommuteResult[];
  averageCommuteTime: number;
}

export class MapboxService {
  private baseClient: any;
  private geocodingClient: any;
  private directionsClient: any;

  constructor() {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MAPBOX_ACCESS_TOKEN not found in environment variables');
    }

    this.baseClient = mbxClient({ accessToken });
    this.geocodingClient = mbxGeocoding(this.baseClient);
    this.directionsClient = mbxDirections(this.baseClient);
  }

  async geocodeAddress(address: string): Promise<GeocodedAddress | null> {
    try {
      const response = await this.geocodingClient
        .forwardGeocode({
          query: address,
          limit: 1,
        })
        .send();

      if (response.body.features.length === 0) {
        return null;
      }

      const feature = response.body.features[0];
      return {
        formatted: feature.place_name,
        lng: feature.center[0],
        lat: feature.center[1],
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  async calculateCommute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<{ duration: number; distance: number } | null> {
    try {
      const response = await this.directionsClient
        .getDirections({
          profile: mode === 'driving' ? 'driving' : mode === 'cycling' ? 'cycling' : 'walking',
          waypoints: [
            { coordinates: [origin.lng, origin.lat] },
            { coordinates: [destination.lng, destination.lat] },
          ],
        })
        .send();

      if (response.body.routes.length === 0) {
        return null;
      }

      const route = response.body.routes[0];
      return {
        duration: Math.round(route.duration / 60),
        distance: Math.round(route.distance / 1000 * 10) / 10,
      };
    } catch (error) {
      console.error('Directions error:', error);
      throw new Error('Failed to calculate commute');
    }
  }

  async compareLocations(
    homeAddress: string,
    options: Array<{ id: string; label: string; address: string }>,
    importantPlaces: Array<{ name: string; address: string }>,
    mode: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<LocationComparison[]> {
    const homeGeo = await this.geocodeAddress(homeAddress);
    if (!homeGeo) {
      throw new Error('Could not geocode home address');
    }

    const placesGeo = await Promise.all(
      importantPlaces.map(async (place) => ({
        name: place.name,
        geo: await this.geocodeAddress(place.address),
      }))
    );

    const validPlaces = placesGeo.filter((p) => p.geo !== null);

    const comparisons = await Promise.all(
      options.map(async (option) => {
        const optionGeo = await this.geocodeAddress(option.address);
        if (!optionGeo) {
          throw new Error(`Could not geocode address for ${option.label}`);
        }

        const commuteToHome = await this.calculateCommute(
          { lat: optionGeo.lat, lng: optionGeo.lng },
          { lat: homeGeo.lat, lng: homeGeo.lng },
          mode
        );

        const commuteToPlaces = await Promise.all(
          validPlaces.map(async (place) => {
            const commute = await this.calculateCommute(
              { lat: optionGeo.lat, lng: optionGeo.lng },
              { lat: place.geo!.lat, lng: place.geo!.lng },
              mode
            );

            return {
              destination: place.name,
              duration: commute?.duration || 0,
              distance: commute?.distance || 0,
            };
          })
        );

        const allCommutes = [
          ...(commuteToHome ? [commuteToHome.duration] : []),
          ...commuteToPlaces.map((c) => c.duration),
        ];
        const averageCommuteTime =
          allCommutes.length > 0
            ? Math.round(allCommutes.reduce((sum, d) => sum + d, 0) / allCommutes.length)
            : 0;

        return {
          optionId: option.id,
          label: option.label,
          address: optionGeo,
          commuteToHome: commuteToHome
            ? {
                destination: 'Home',
                duration: commuteToHome.duration,
                distance: commuteToHome.distance,
              }
            : undefined,
          commuteToPlaces,
          averageCommuteTime,
        };
      })
    );

    return comparisons;
  }
}
