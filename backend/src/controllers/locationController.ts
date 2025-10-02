import { Request, Response } from 'express';
import { MapboxService } from '../services/mapboxService';

let mapboxService: MapboxService;

const getMapboxService = () => {
  if (!mapboxService) {
    mapboxService = new MapboxService();
  }
  return mapboxService;
};

export const geocodeAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({
        success: false,
        message: 'Address is required',
      });
      return;
    }

    const result = await getMapboxService().geocodeAddress(address);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Address not found',
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to geocode address',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const calculateCommute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;

    if (!origin || !destination) {
      res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required',
      });
      return;
    }

    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      res.status(400).json({
        success: false,
        message: 'Invalid coordinates format',
      });
      return;
    }

    const result = await getMapboxService().calculateCommute(origin, destination, mode);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Calculate commute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate commute',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const compareLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { homeAddress, options, importantPlaces = [], mode = 'driving' } = req.body;

    if (!homeAddress) {
      res.status(400).json({
        success: false,
        message: 'Home address is required',
      });
      return;
    }

    if (!options || !Array.isArray(options) || options.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one option is required',
      });
      return;
    }

    for (const option of options) {
      if (!option.id || !option.label || !option.address) {
        res.status(400).json({
          success: false,
          message: 'Each option must have id, label, and address',
        });
        return;
      }
    }

    const comparisons = await getMapboxService().compareLocations(
      homeAddress,
      options,
      importantPlaces,
      mode
    );

    res.json({
      success: true,
      data: {
        comparisons,
        mode,
      },
    });
  } catch (error: any) {
    console.error('Compare locations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to compare locations',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
