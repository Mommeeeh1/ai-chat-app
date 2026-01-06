import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWorkouts() {
  console.log('🌱 Seeding exercises and workout templates...');

  // Create exercises
  const exercises = await Promise.all([
    // Chest exercises
    prisma.exercise.create({
      data: {
        name: 'Bench Press',
        description: 'Classic chest exercise for building mass and strength',
        muscleGroup: 'chest',
        equipment: ['barbell', 'bench'],
        difficulty: 'intermediate',
        instructions: '1. Lie on bench with feet flat\n2. Grip bar slightly wider than shoulder width\n3. Lower bar to mid-chest\n4. Press up explosively\n5. Keep core tight throughout',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Push-ups',
        description: 'Bodyweight chest exercise that can be done anywhere',
        muscleGroup: 'chest',
        equipment: [],
        difficulty: 'beginner',
        instructions: '1. Start in plank position\n2. Hands shoulder-width apart\n3. Lower body until chest nearly touches floor\n4. Push back up\n5. Keep body straight throughout',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Dumbbell Flyes',
        description: 'Isolation exercise for chest development',
        muscleGroup: 'chest',
        equipment: ['dumbbells', 'bench'],
        difficulty: 'intermediate',
        instructions: '1. Lie on bench holding dumbbells\n2. Start with arms extended above chest\n3. Lower dumbbells in arc motion\n4. Feel stretch in chest\n5. Bring dumbbells back together',
      },
    }),

    // Back exercises
    prisma.exercise.create({
      data: {
        name: 'Pull-ups',
        description: 'Upper body compound exercise for back and arms',
        muscleGroup: 'back',
        equipment: ['pull-up bar'],
        difficulty: 'intermediate',
        instructions: '1. Hang from bar with overhand grip\n2. Pull yourself up until chin over bar\n3. Lower with control\n4. Keep core engaged\n5. Full range of motion',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Bent Over Rows',
        description: 'Compound back exercise for thickness and strength',
        muscleGroup: 'back',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: '1. Bend at hips, back straight\n2. Grip barbell shoulder-width\n3. Pull bar to lower chest\n4. Squeeze shoulder blades\n5. Lower with control',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Deadlift',
        description: 'Full body compound exercise, primarily targets back',
        muscleGroup: 'back',
        equipment: ['barbell'],
        difficulty: 'advanced',
        instructions: '1. Stand with feet hip-width\n2. Grip bar just outside legs\n3. Keep back straight, chest up\n4. Drive through heels\n5. Stand tall, squeeze glutes',
      },
    }),

    // Leg exercises
    prisma.exercise.create({
      data: {
        name: 'Squats',
        description: 'King of leg exercises, works entire lower body',
        muscleGroup: 'legs',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: '1. Bar on upper back\n2. Feet shoulder-width apart\n3. Lower until thighs parallel\n4. Drive through heels\n5. Keep chest up',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Lunges',
        description: 'Unilateral leg exercise for balance and strength',
        muscleGroup: 'legs',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        instructions: '1. Step forward with one leg\n2. Lower back knee toward floor\n3. Keep front knee over ankle\n4. Push back to start\n5. Alternate legs',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Leg Press',
        description: 'Machine-based compound leg exercise',
        muscleGroup: 'legs',
        equipment: ['machine'],
        difficulty: 'beginner',
        instructions: '1. Sit in machine, feet on platform\n2. Lower platform with control\n3. Press through heels\n4. Don\'t lock knees\n5. Full range of motion',
      },
    }),

    // Shoulder exercises
    prisma.exercise.create({
      data: {
        name: 'Overhead Press',
        description: 'Compound shoulder exercise for mass and strength',
        muscleGroup: 'shoulders',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: '1. Bar at shoulder height\n2. Press overhead\n3. Lock out at top\n4. Lower with control\n5. Keep core tight',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Lateral Raises',
        description: 'Isolation exercise for side delts',
        muscleGroup: 'shoulders',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        instructions: '1. Hold dumbbells at sides\n2. Raise arms to shoulder height\n3. Keep slight bend in elbows\n4. Lower with control\n5. Don\'t swing',
      },
    }),

    // Arm exercises
    prisma.exercise.create({
      data: {
        name: 'Bicep Curls',
        description: 'Classic arm exercise for bicep development',
        muscleGroup: 'arms',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        instructions: '1. Hold dumbbells at sides\n2. Curl up to shoulders\n3. Keep elbows stationary\n4. Squeeze at top\n5. Lower with control',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Tricep Dips',
        description: 'Bodyweight exercise for triceps',
        muscleGroup: 'arms',
        equipment: ['dip bars'],
        difficulty: 'intermediate',
        instructions: '1. Support body on dip bars\n2. Lower until upper arms parallel\n3. Push back up\n4. Keep body upright\n5. Full range of motion',
      },
    }),

    // Core exercises
    prisma.exercise.create({
      data: {
        name: 'Plank',
        description: 'Isometric core exercise for stability',
        muscleGroup: 'core',
        equipment: [],
        difficulty: 'beginner',
        instructions: '1. Forearms on ground\n2. Body in straight line\n3. Engage core\n4. Hold position\n5. Don\'t let hips sag',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Russian Twists',
        description: 'Rotational core exercise',
        muscleGroup: 'core',
        equipment: [],
        difficulty: 'beginner',
        instructions: '1. Sit with knees bent\n2. Lean back slightly\n3. Rotate torso side to side\n4. Keep core engaged\n5. Control the movement',
      },
    }),
  ]);

  console.log(`✅ Created ${exercises.length} exercises`);

  // Create workout templates
  const beginnerFullBody = await prisma.workout.create({
    data: {
      name: 'Beginner Full Body',
      description: 'Perfect for beginners starting their fitness journey',
      difficulty: 'beginner',
      duration: 45,
      equipment: ['dumbbells'],
      isTemplate: true,
    },
  });

  await Promise.all([
    prisma.workoutExercise.create({
      data: {
        workoutId: beginnerFullBody.id,
        exerciseId: exercises.find((e) => e.name === 'Push-ups')!.id,
        order: 1,
        sets: 3,
        reps: '8-12',
        rest: 60,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: beginnerFullBody.id,
        exerciseId: exercises.find((e) => e.name === 'Lunges')!.id,
        order: 2,
        sets: 3,
        reps: '10',
        rest: 60,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: beginnerFullBody.id,
        exerciseId: exercises.find((e) => e.name === 'Bicep Curls')!.id,
        order: 3,
        sets: 3,
        reps: '10-12',
        rest: 60,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: beginnerFullBody.id,
        exerciseId: exercises.find((e) => e.name === 'Plank')!.id,
        order: 4,
        sets: 3,
        duration: 30,
        rest: 60,
        notes: 'Hold for specified duration',
      },
    }),
  ]);

  const intermediateUpperBody = await prisma.workout.create({
    data: {
      name: 'Intermediate Upper Body',
      description: 'Build upper body strength and muscle',
      difficulty: 'intermediate',
      duration: 60,
      equipment: ['barbell', 'dumbbells', 'bench'],
      isTemplate: true,
    },
  });

  await Promise.all([
    prisma.workoutExercise.create({
      data: {
        workoutId: intermediateUpperBody.id,
        exerciseId: exercises.find((e) => e.name === 'Bench Press')!.id,
        order: 1,
        sets: 4,
        reps: '8-10',
        rest: 90,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: intermediateUpperBody.id,
        exerciseId: exercises.find((e) => e.name === 'Bent Over Rows')!.id,
        order: 2,
        sets: 4,
        reps: '8-10',
        rest: 90,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: intermediateUpperBody.id,
        exerciseId: exercises.find((e) => e.name === 'Overhead Press')!.id,
        order: 3,
        sets: 3,
        reps: '8-12',
        rest: 90,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: intermediateUpperBody.id,
        exerciseId: exercises.find((e) => e.name === 'Dumbbell Flyes')!.id,
        order: 4,
        sets: 3,
        reps: '12-15',
        rest: 60,
      },
    }),
  ]);

  const advancedLegDay = await prisma.workout.create({
    data: {
      name: 'Advanced Leg Day',
      description: 'Intense leg workout for experienced lifters',
      difficulty: 'advanced',
      duration: 75,
      equipment: ['barbell', 'machine'],
      isTemplate: true,
    },
  });

  await Promise.all([
    prisma.workoutExercise.create({
      data: {
        workoutId: advancedLegDay.id,
        exerciseId: exercises.find((e) => e.name === 'Squats')!.id,
        order: 1,
        sets: 5,
        reps: '5',
        rest: 180,
        notes: 'Heavy weight, low reps',
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: advancedLegDay.id,
        exerciseId: exercises.find((e) => e.name === 'Deadlift')!.id,
        order: 2,
        sets: 4,
        reps: '6',
        rest: 180,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: advancedLegDay.id,
        exerciseId: exercises.find((e) => e.name === 'Leg Press')!.id,
        order: 3,
        sets: 4,
        reps: '12-15',
        rest: 90,
      },
    }),
    prisma.workoutExercise.create({
      data: {
        workoutId: advancedLegDay.id,
        exerciseId: exercises.find((e) => e.name === 'Lunges')!.id,
        order: 4,
        sets: 3,
        reps: '12',
        rest: 60,
      },
    }),
  ]);

  console.log('✅ Created 3 workout templates');
  console.log('🎉 Seeding complete!');
}

seedWorkouts()
  .catch((error) => {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


