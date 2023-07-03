

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const day = date.getDate();
const _ = require('lodash');
const capitalize = require('lodash.capitalize');
const mongoose = require("mongoose");
const app = express();
let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
} 
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


async function connectWeb(){
  await mongoose.connect("mongodb+srv://Suryadeep31:i2lyQBMv0eAeZowf@fruitsreviews.zztdnvq.mongodb.net/?retryWrites=true&w=majority");
}
setTimeout(connectWeb, 10001);

const itemSchema = new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item", itemSchema);


const item = new Item({
  name:"Welcome to ToDoList"
})
const item2 = new Item({
  name:"create new tasks using '+' button"
})
const item3 = new Item({
  name:"<-- press this box to delete tasks"
})
const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});
const defualtItem = [item, item2, item3];
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  
  Item.find({}).then((foundItem) => {
    if(foundItem.length === 0){
      Item.create(defualtItem);
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItem});
    }
  }).catch((err) => {
    console.log(err);
    process.exit();
  });
});

app.post("/", function(req, res){

  const addedItem = req.body.newItem;
  const addedList = req.body.list;
  const item4 = new Item({
    name: addedItem
  });
  if(addedList === day){
    item4.save();
    res.redirect("/");
  }
  else{
    List.findOne({
      name: addedList
    }).then((result) => {
      result.items.push(item4)
      result.save();
      res.redirect("/"+addedList);
    })
  }

});

app.post("/delete", function(req, res){
  const removedItemId = req.body.checkbox;
  const perticularList = req.body.listName;

  if(perticularList === day){
    Item.findByIdAndRemove(removedItemId).catch((err) => {
      console.log("error");
      
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: perticularList}, {$pull: {items: {_id: removedItemId}}}).catch((err) => {
      console.log(err);
      process.exit();
    });
    res.redirect("/"+perticularList);
  }

})
app.get('/:newListName', (req, res) => {
  const newListName = _.capitalize(req.params.newListName);
  List.findOne({
    name: newListName
  }).then((result) => {
    if(result){
      res.render("list", {listTitle: result.name, newListItems: result.items})
    }
    else{ 
      const list2 = new List({
        name: newListName,
        items: defualtItem
      });
      list2.save();
      res.redirect("/"+ newListName);
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port "+port);
});



 
