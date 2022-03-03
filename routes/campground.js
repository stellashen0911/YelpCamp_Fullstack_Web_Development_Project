const express = require('express');
const router = express.Router();
const catchAsyn = require('../utilities/CatchAsyn');
const Campground = require('../models/campground');
const {isLoggedIn} = require('../middleware');
const ExpressErros = require('../utilities/ExpressErrors');
const {campgroundSchema, reviewSchema} = require('../schema.js');

//add middleware to validate campground schema and review schema
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ExpressErros(msg, 400);
    } else {
        next();
    }
}

router.get('', catchAsyn(async (req, res) => {
    const campground = await Campground.find({});
    res.render('campground/index', {campground});
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campground/new');
});

router.post('', validateCampground, catchAsyn(async (req, res) => {
    //if(!req.body.campground) throw new ExpressErros("Invalid Campground!", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campground/${campground._id}`);
}));

router.get('/:id', catchAsyn(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground) {
        req.flash('error', 'There is no such campground!');
        return res.redirect('/campground');
    }
    res.render('campground/showid', {campground});
}));

router.get('/:id/edit', catchAsyn(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'There is no such campground!');
        return res.redirect('/campground');
    }
    res.render('campground/edit', {campground});
}));

router.put('/:id', validateCampground, catchAsyn(async (req, res) => {
    const { id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success', 'Successfully updated a campground!');
    res.redirect(`/campground/${campground._id}`);
}));

router.delete('/:id', catchAsyn(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect(`/campground`);
}));

module.exports = router;