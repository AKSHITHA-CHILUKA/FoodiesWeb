const asyncHandler = require('express-async-handler');
const Breakfast = require('../models/breakfast');
const Lunch = require('../models/lunch');
const Dinner = require('../models/dinner');
const Canteen = require("../models/canteenLoginInfo");
<<<<<<< Updated upstream
=======
const Feedback = require("../models/feedback")
const Session = require("../models/session")
>>>>>>> Stashed changes
const { uploader } = require('../config/cloudinaryConfig');



const getAllCanteen = async (req ,res , next) =>{
  
  try{
    const canteenData = await Canteen.find({});
    
    res.status(200)
    .json({
      success : true,
      data : canteenData,
      message : "Entire canteens fetched"
    });
  }
  catch(error){
    res.status(500).json({success : false , error : error});
  }
};

const getBreakfast = async(req , res , next) =>{
  
  try{
    const id  = req.params.id;
  
    const breakfastData = await Breakfast.find({ canteen: id }).select("dish").select("dishId").exec();

    
    res.status(200)
    .json({
      success : true,
      data : breakfastData,
      message : "Entire breakfast was fetched"
    });
  }
  catch(error){
    res.status(500).json({success : false , error : error});
  }
}
const feedback = async (req, res) => {
  const { canteenId, feedback, rating } = req.body;
  const token = req.body.studentId; // This is the token

  try {
    // Find the session with the given token
    const session = await Session.findOne({ token });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = session.userId; // Extract userId from the session

    const newFeedback = new Feedback({
      canteen: canteenId,
      student: userId,
      comment: feedback,
      rating: rating,
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Error saving feedback', error: error.message });
  }
};
const canteenFeedbackRender = async (req, res) => {
  try {
    const reviews = await Feedback.aggregate([
      { $sample: { size: 3 } }, // Fetch 3 random feedback entries
      {
        $lookup: {
          from: 'students', // Collection name for students
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $lookup: {
          from: 'canteens', // Collection name for canteens
          localField: 'canteen',
          foreignField: '_id',
          as: 'canteenInfo'
        }
      },
      {
        $addFields: {
          studentName: { $arrayElemAt: ['$studentInfo.name', 0] },
          canteenName: { $arrayElemAt: ['$canteenInfo.name', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          comment: 1,
          rating: 1,
          createdAt: 1,
          studentName: 1,
          canteenName: 1
        }
      }
    ]);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLunch = async(req , res , next) =>{
  
  try{
    const id  = req.params.id;
    
    const lunchData = await Lunch.find({ canteen: id }).select("dish").select("dishId").exec();

    
    res.status(200)
    .json({
      success : true,
      data : lunchData,
      message : "Entire lunch was fetched"
    });
  }
  catch(error){
    res.status(500).json({success : false , error : error});
  }
}

const getDinner = async(req , res , next) =>{
  
  try{
    const id  = req.params.id;
    const dinnerData = await Dinner.find({ canteen: id }).select("dish").select("dishId").exec();

    
    res.status(200)
    .json({
      success : true,
      data : dinnerData,
      message : "Entire dinner was fetched"
    });
  }
  catch(error){
    res.status(500).json({success : false , error : error});
  }
}

// Controller function to get the canteen's dashboard
const getCanteenDashboard = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;

  const breakfastDishes = await Breakfast.find({ canteen: canteenId }).select('dish').exec();
  const lunchDishes = await Lunch.find({ canteen: canteenId }).select('dish').exec();
  const dinnerDishes = await Dinner.find({ canteen: canteenId }).select('dish').exec();

  res.json({
    breakfast: breakfastDishes.length > 0 ? breakfastDishes : ['Not Added Yet'],
    lunch: lunchDishes.length > 0 ? lunchDishes : ['Not Added Yet'],
    dinner: dinnerDishes.length > 0 ? dinnerDishes : ['Not Added Yet'],
  });
});

// Controller function to add a breakfast dish
const addBreakfastDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const { dish , dishId } = req.body;

  const existingDish = await Breakfast.findOne({ canteen: canteenId, dish }).exec();

  if (existingDish) {
    return res.json({ message: 'Dish already added' });
  }

  const newDish = new Breakfast({ canteen: canteenId, dish , dishId });
  await newDish.save();

  res.json({ message: 'Dish added successfully' });
});

// Controller function to remove a breakfast dish
const removeBreakfastDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const  dish  = req.body._id;

  await Breakfast.deleteOne({ _id:dish }).exec();
  res.json({ message: 'Dish removed successfully' });
});

// Implement similar functions for lunch and dinner dishes
// addLunchDish, removeLunchDish, addDinnerDish, and removeDinnerDish

// Controller function to add a lunch dish
const addLunchDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const { dish, dishId } = req.body;

  const existingDish = await Lunch.findOne({ canteen: canteenId, dish }).exec();

  if (existingDish) {
    return res.json({ message: 'Dish already added' });
  }

  const newDish = new Lunch({ canteen: canteenId, dish , dishId });
  await newDish.save();

  res.json({ message: 'Dish added successfully' });
});

// Controller function to remove a lunch dish
const removeLunchDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const  dish  = req.body._id;

  await Lunch.deleteOne({ _id:dish }).exec();
  res.json({ message: 'Dish removed successfully' });

});

// Controller function to add a dinner dish
const addDinnerDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const { dish , dishId} = req.body;

  const existingDish = await Dinner.findOne({ canteen: canteenId, dish }).exec();

  if (existingDish) {
    return res.json({ message: 'Dish already added' });
  }

  const newDish = new Dinner({ canteen: canteenId, dish ,dishId});
  await newDish.save();

  res.json({ message: 'Dish added successfully' });

});

// Controller function to remove a dinner dish
const removeDinnerDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const  dish  = req.body._id;

  await Dinner.deleteOne({ _id:dish }).exec();
  res.json({ message: 'Dish removed successfully' });

});
// Controller function to update canteen details


const updateCanteen = async (req, res, next) => {
  try {
    const canteenId = req.params.id;
    const { name, email, collegeName, canteenImage } = req.body;

    // Process the uploaded file if exists
    if (req.file) {
      const filePath = `public/uploads/${req.file.originalname}`;
      const uploadedImage = await uploader.upload(filePath);
      req.body.canteenImage = uploadedImage.url; // Update the canteenImage with the uploaded file URL
    }

    // Find the canteen by ID and update
    const canteen = await Canteen.findByIdAndUpdate(canteenId, req.body, { new: true });

    // If canteen not found, return error
    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" });
    }

    // Return success response
    res.status(200).json({ success: true, message: "Canteen updated successfully", data: canteen });
  } catch (error) {
    // Handle errors
    console.error("Error updating canteen:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
//controller to update Canteen FoddItem Details


// Controller function to update a breakfast dish
const updateBreakfastDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const { dishId, dish } = req.body;

  try {
    const updatedDish = await Breakfast.findOneAndUpdate(
      { _id: dishId, canteen: canteenId },
      { $set: { dish } },
      { new: true }
    ).exec();

    if (!updatedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    res.json({ message: 'Dish updated successfully', data: updatedDish });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
//Controller to update Lunch
const updateLunchDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const { dishId, dish } = req.body;

  try {
    const updatedDish = await Lunch.findOneAndUpdate(
      { _id: dishId, canteen: canteenId },
      { $set: { dish } },
      { new: true }
    ).exec();

    if (!updatedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    res.json({ message: 'Dish updated successfully', data: updatedDish });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
//Controller to update dinner

const updateDinnerDish = asyncHandler(async (req, res, next) => {
  const canteenId = req.params.id;
  const { dishId, dish } = req.body;

  try {
    const updatedDish = await Dinner.findOneAndUpdate(
      { _id: dishId, canteen: canteenId },
      { $set: { dish } },
      { new: true }
    ).exec();

    if (!updatedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    res.json({ message: 'Dish updated successfully', data: updatedDish });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = {
  getCanteenDashboard,
  addBreakfastDish,
  removeBreakfastDish,
  addLunchDish,
  removeLunchDish,
  addDinnerDish,
  removeDinnerDish,
  getAllCanteen,
  getBreakfast,
  getLunch,
  getDinner,
  updateCanteen,
  updateBreakfastDish,
  updateLunchDish,
  updateDinnerDish,
<<<<<<< Updated upstream
=======
  feedback,
  canteenFeedbackRender
>>>>>>> Stashed changes
};
