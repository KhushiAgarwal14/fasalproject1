
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const User = require('../models/user');
const PlayList = require('../models/playlist');


router.get('/home', isLoggedIn, async (req, res) => {
    const user=await User.findById(req.user._id);
    const action=await user.populate('action')
    const horror=await user.populate('horror')
    const fantasy=await user.populate('fantasy')
    const use=await user.populate('drama')
    const comedy=await user.populate('comedy')
    res.render("home",{use})

});


router.post("/movie/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const movie = await fetch(`http://www.omdbapi.com/?i=${id}&apikey=61a97da2`)
            .then(res => res.json());
            
        let isAdded= await PlayList.find({});
        isAdded=isAdded.filter((item)=>item.name===movie.Title);
        console.log(isAdded);
        if(isAdded.length!=0){
            res.send("Already Added")
            return ;
        }
        const playList = new PlayList({ name: movie.Title, image: movie.Poster, year: movie.Year });
        const genre = movie.Genre;
        const user = await User.findById(req.user._id);

        if (genre.indexOf('Action') >= 0) {
            user.action.push(playList);
        } else if (genre.indexOf('Horror') >= 0) {
            user.horror.push(playList);
        } else if (genre.indexOf('Drama') >= 0) {
            user.drama.push(playList);
        } else if (genre.indexOf('Comedy') >= 0) {
            user.comedy.push(playList);
        } else {
            user.fantasy.push(playList);
        }

        await playList.save();
        await user.save();

        res.redirect("/home");
    } catch (err) {
        console.error('Error adding movie to playlist:', err);
        res.status(500).send('Internal Server Error');
    }
});


router.post("/movie/remove/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(req.user._id);
        const playList = await PlayList.findById(id);

        if (!playList) {
            res.status(404).send('Playlist not found');
            return;
        }

        user.action = user.action.filter(item => item.toString() !== id);
        user.horror = user.horror.filter(item => item.toString() !== id);
        user.fantasy = user.fantasy.filter(item => item.toString() !== id);
        user.drama = user.drama.filter(item => item.toString() !== id);
        user.comedy = user.comedy.filter(item => item.toString() !== id);

        await PlayList.findByIdAndDelete(id);
        await user.save();

        res.redirect("/home");
    } catch (err) {
        console.error('Error removing movie from playlist:', err);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;

























// // module.exports = router;