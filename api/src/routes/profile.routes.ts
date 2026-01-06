import { Router, Response } from 'express';
import * as profileService from '../services/profile.service';
import { createChildLogger } from '../utils/logger';
import { asyncHandler, validateBody, authenticate, AuthenticatedRequest } from '../middleware';
import { updateProfileSchema, ProfileResponseDTO } from '../dtos/profile.dto';
import { HttpStatus, PROFILE_MESSAGES } from '../constants';

const router = Router();

// LAZY INITIALIZATION: Create logger only when first needed
let routeLogger: ReturnType<typeof createChildLogger>;
function getLogger() {
  if (!routeLogger) {
    routeLogger = createChildLogger({ module: 'routes', service: 'ProfileRoutes' });
  }
  return routeLogger;
}

router.get(
  '/',
  authenticate, // ← Protected: requires JWT token
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ProfileResponseDTO>) => {
    getLogger().info('Get profile request received');

    // req.user is available because of authenticate middleware
    const userId = req.user!.userId;

    getLogger().debug(`Calling profileService.getProfile() for user: ${userId}`);
    const profile = await profileService.getProfile(userId);

    getLogger().info(`Profile retrieved successfully for user: ${userId}`);
    res.status(HttpStatus.OK).json(profile);
  })
);

router.put(
  '/',
  authenticate, // ← Protected: requires JWT token
  validateBody(updateProfileSchema), // Validate request body
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ProfileResponseDTO>) => {
    getLogger().info('Update profile request received');

    const userId = req.user!.userId;
    const data = req.body;

    getLogger().debug(`Calling profileService.upsertProfile() for user: ${userId}`);
    const profile = await profileService.upsertProfile(userId, data);

    getLogger().info(`Profile updated successfully for user: ${userId}`);
    res.status(HttpStatus.OK).json(profile);
  })
);

router.delete(
  '/',
  authenticate, // ← Protected: requires JWT token
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    getLogger().info('Delete profile request received');

    const userId = req.user!.userId;

    getLogger().debug(`Calling profileService.deleteProfile() for user: ${userId}`);
    await profileService.deleteProfile(userId);

    getLogger().info(`Profile deleted successfully for user: ${userId}`);
    res.status(HttpStatus.OK).json({
      message: PROFILE_MESSAGES.DELETED,
    });
  })
);

export default router;


