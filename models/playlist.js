const mongoose=require("mongoose");

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    year: { type: String, required: true },
    backgroundColor: {
      type: String,
      default: '#fff' // Default background color if not specified
  }
  });
  
  const PlayList=mongoose.model('PlayList',PlaylistSchema);

  module.exports=PlayList;