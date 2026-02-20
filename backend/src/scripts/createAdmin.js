import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@hrms.com' });
    if (adminExists) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email: admin@hrms.com');
      console.log('🔄 Deleting existing admin to recreate...');
      await User.deleteOne({ email: 'admin@hrms.com' });
    }

    // Don't hash password manually - let the User model's pre-save hook handle it
    const admin = await User.create({
      email: 'admin@hrms.com',
      password: 'admin123', // Plain password - will be hashed by pre-save hook
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hrms.com');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();

