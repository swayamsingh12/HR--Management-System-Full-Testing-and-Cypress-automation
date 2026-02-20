import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const createHR = async () => {
  try {
    await connectDB();
    
    const hrExists = await User.findOne({ email: 'hr@hrms.com' });
    if (hrExists) {
      console.log('⚠️  HR user already exists');
      console.log('📧 Email: hr@hrms.com');
      console.log('🔄 Deleting existing HR user to recreate...');
      await User.deleteOne({ email: 'hr@hrms.com' });
    }

    // Don't hash password manually - let the User model's pre-save hook handle it
    const hr = await User.create({
      email: 'hr@hrms.com',
      password: '123456', // Plain password - will be hashed by pre-save hook
      role: 'hr',
      isActive: true
    });

    console.log('✅ HR user created successfully!');
    console.log('📧 Email: hr@hrms.com');
    console.log('🔑 Password: 123456');
    console.log('\n⚠️  Please change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating HR user:', error.message);
    process.exit(1);
  }
};

createHR();

