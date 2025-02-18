const mongoose =require('mongoose')
mongoose.connect('mongodb+srv://rishabpanda779:skpsmp123@cluster0.0pcro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

const userSchema =mongoose.Schema ({
    username:String,
    email:String,
    password:String,  
    age: Number       
})
module.exports=mongoose.model('User',userSchema)
