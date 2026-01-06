import { Router } from 'express';
import { workoutService } from '../services/workout.service';
import { authenticate, AuthenticatedRequest, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/workouts/templates:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get workout templates
 *     description: Retrieve all pre-built workout templates, optionally filtered by difficulty
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *     responses:
 *       200:
 *         description: Workout templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/templates',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const difficulty = req.query.difficulty as string | undefined;
    const templates = await workoutService.getWorkoutTemplates(difficulty);
    res.json(templates);
  })
);

/**
 * @swagger
 * /api/workouts/my:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get user's custom workouts
 *     description: Retrieve all workouts created by the authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Custom workouts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/my',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const workouts = await workoutService.getUserWorkouts(userId);
    res.json(workouts);
  })
);

/**
 * @swagger
 * /api/workouts/exercises:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get exercises
 *     description: Retrieve all available exercises, optionally filtered by muscle group or difficulty
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: muscleGroup
 *         schema:
 *           type: string
 *         description: Filter by muscle group (e.g., chest, back, legs)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *     responses:
 *       200:
 *         description: Exercises retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/exercises',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const muscleGroup = req.query.muscleGroup as string | undefined;
    const difficulty = req.query.difficulty as string | undefined;
    const exercises = await workoutService.getExercises(muscleGroup, difficulty);
    res.json(exercises);
  })
);

/**
 * @swagger
 * /api/workouts/{id}:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get workout by ID
 *     description: Retrieve detailed information about a specific workout
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workout not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const workout = await workoutService.getWorkoutById(id as string);
    res.json(workout);
  })
);

/**
 * @swagger
 * /api/workouts:
 *   post:
 *     tags:
 *       - Workouts
 *     summary: Create custom workout
 *     description: Create a new custom workout plan
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - difficulty
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Custom Workout
 *               description:
 *                 type: string
 *                 example: A personalized workout plan
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: intermediate
 *               duration:
 *                 type: number
 *                 description: Estimated duration in minutes
 *                 example: 45
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["dumbbells", "resistance_bands"]
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     exerciseId:
 *                       type: string
 *                       format: uuid
 *                     sets:
 *                       type: number
 *                     reps:
 *                       type: string
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workout'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { name, description, difficulty, duration, equipment, exercises } = req.body;

    if (!name || !difficulty) {
      res.status(400).json({ message: 'Name and difficulty are required' });
      return;
    }

    const workout = await workoutService.createWorkout(userId, {
      name,
      description,
      difficulty,
      duration,
      equipment: equipment || [],
      exercises: exercises || [],
    });

    res.status(201).json(workout);
  })
);

/**
 * @swagger
 * /api/workouts/{id}:
 *   delete:
 *     tags:
 *       - Workouts
 *     summary: Delete custom workout
 *     description: Delete a user's custom workout
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Workout deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to delete this workout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workout not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    await workoutService.deleteWorkout(userId, id as string);
    res.json({ message: 'Workout deleted successfully' });
  })
);

/**
 * @swagger
 * /api/workouts/log:
 *   post:
 *     tags:
 *       - Workouts
 *     summary: Log completed workout
 *     description: Record a completed workout session
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               workoutId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the workout template (if used)
 *               name:
 *                 type: string
 *                 example: Morning Cardio Session
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: When the workout was completed (defaults to now)
 *               duration:
 *                 type: number
 *                 description: Duration in minutes
 *                 example: 45
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     exerciseId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     sets:
 *                       type: number
 *                     reps:
 *                       type: string
 *               notes:
 *                 type: string
 *                 example: Felt great today!
 *     responses:
 *       201:
 *         description: Workout logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 duration:
 *                   type: number
 *                 notes:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/log',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { workoutId, name, date, duration, exercises, notes } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Workout name is required' });
      return;
    }

    const log = await workoutService.logWorkout(userId, {
      workoutId,
      name,
      date: date ? new Date(date) : undefined,
      duration,
      exercises: exercises || [],
      notes,
    });

    res.status(201).json(log);
  })
);

/**
 * @swagger
 * /api/workouts/history/all:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get workout history
 *     description: Retrieve the user's workout history
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: Workout history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   duration:
 *                     type: number
 *                   notes:
 *                     type: string
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/history/all',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const history = await workoutService.getWorkoutHistory(userId, limit);
    res.json(history);
  })
);

/**
 * @swagger
 * /api/workouts/stats/summary:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get workout statistics
 *     description: Retrieve workout statistics and analytics for the user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Workout statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalWorkouts:
 *                   type: number
 *                   example: 42
 *                 totalHours:
 *                   type: number
 *                   example: 35
 *                 currentWeekWorkouts:
 *                   type: number
 *                   example: 3
 *                 averagePerWeek:
 *                   type: number
 *                   example: 4
 *                 lastWorkout:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/stats/summary',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const stats = await workoutService.getWorkoutStats(userId);
    res.json(stats);
  })
);

export default router;
