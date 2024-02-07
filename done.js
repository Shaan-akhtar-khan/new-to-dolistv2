//jshint esversion:6
/*
const express = require("express");
const bodyParser = require("body-parser");
// simplifying const date = require(__dirname + "/date.js");

const app = express();
const mongoose = require("mongoose");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/toDo-List-DB" , { useNewUrlParser : true});

const schema = { name : String };

const item = mongoose.model( "items" , schema);

const workItems = [];
const item1 = new item( { name : "welcom you bitch"} );
const item2 = new item( { name : "hit the +  button to add more"} );
const item3 = new item( { name : "hit this to delete an item"} );

const defaultItems = [item1 , item2 , item3];

app.get("/", async function(req, res)
{
  try 
  {
     const query = item.find({}).lean().exec();

     if(query.length === 0)
     {
        await item.insertMany(defaultItems);
        res.redirect("/");
     }
     else
     {
        console.log(query);
        res.render("list", { listTitle: "Today", newListItems: query });
     }
     
  }
  catch(err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  }

} );



app.post("/", function(req, res){

  const newitem = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(newitem);
    res.redirect("/work");
  } else {
    items.push(newitem);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
*/


//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/toDo-List-DB", { useNewUrlParser: true });

const Itemschema = { name: String };
const itemModel = mongoose.model("item", Itemschema);

const workItems = [];
const item1 = new itemModel({ name: "welcom you bitch" });
const item2 = new itemModel({ name: "hit the + button to add more" });
const item3 = new itemModel({ name: "hit this to delete an item" });
//these are the items that are used to be the home page without enterng any data

const defaultItems = [item1, item2, item3];
//push to array defaultItems

const ListSchema = { name : String , itemsArray : [Itemschema] } ;

const ListModel = mongoose.model("List" , ListSchema);

app.get("/", async function (req, res) {
  // dont declare app.get as async for teh await used inside the anonymous function
  try {
    const query = await itemModel.find({}).exec();
//the lean() makes sure that we get the JS object only not the mongoose object coz that comes with some overhead and we just need the raw data here and
// we wont do a lot of modifications so we dont need the mongoose object also this  whole line sends the whole array pushed to the collection of itemModel into the query variable
//so query now holds the whole array

    if (query.length === 0) {
      // if we havent entered any entry to the home page then insert the predefine entries item1,item2,item3 only

      await itemModel.insertMany(defaultItems).exec();
      res.redirect("/");
      // to see the item1,2,3 inserted if only they are avialable 
      //else if there are more tha 1,2,3 avaialable then else block

    } else {
      console.log(query);
      res.render("list", { listTitle: "Today", newListItems: query });// see 174 app.post("/") to know the significance of "Today"
      //list title is the header and new list items is the items added to the list by the user
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  }

});
//done

app.post("/", async function (req, res) {
  
  const listName = req.body.list ;// extracts the list name or page name
  const  item = req.body.newItem;//extracts the data
console.log("the item entered in" + listName + " is " + item);

 const new_item = new itemModel( { name : item});//creaing the object instead of using the name
 //create a new document based on the itemModel model for the corresponding  collection and schema mentioned in the model

     if(listName === "Today")// see 130( app.get("/") )
    {
      await new_item.save(); // saved to itemModel model || saved to the items collection so app.get("/") will be able to extract it from the collecction "items"
       // this means that we have added this entry to the home page or "today" page 
       res.redirect("/");// redirect to the "today" page to see the new entry

    }
    else
    {//if the page where the entry was made was not "today" || home page then 
      const foundList = await ListModel.findOne({ name : listName  } ).exec();
       
      // find all the previous entries of this page named-ListName and store it in foundList as an array. (note the default items were already there before
      //any entry)
      await foundList.itemsArray.push(new_item);

        try
        {
          await foundList.save()//save this array as the original array
           res.redirect("/" + listName);//open the page again to see the changes app.get(/:customparam)
        }catch(err)
        {
          console.log(err);
          res.status(500).send("Error adding item");

        }

      }

    });
    
   //redirect to see the changes

app.post("/delete", async function (req, res) {
  const del_id = req.body.checkbox;

  try {
    await itemModel.findByIdAndDelete(del_id);
    // required to await for the promise and declare the func as async
    res.redirect("/");

    // to see the changes
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting item");
  }
});



app.get("/:customparam", async function (req, res) {
  const page = req.params.customparam;

  if (page === "favicon.ico") {
    return res.status(204).end();  // 204 No Content, indicating that there is no favicon
  }

  console.log("the requested page is " + page);
  //get the name of the http page request and store in "page"

  
    const foundList = await ListModel.findOne({ name : page }).exec();
// find a doc list of Lists collection with the same name as page
     
   try{
    if (!foundList)
     {
      // if not found in lists collection create one
      const newList = new ListModel
       ({
        name: page,
        itemsArray: defaultItems,
        });
       console.log("the foundlist is empty so inside the if statement ")
      await newList.save();
      console.log("the list created in if block has been saved");
      console.log("redirecting to /" + page);
      res.redirect("/" + page );
      //so that you dont have to press enter twice on the HTTP request(one for creating the page and one for accessing it)

    }
     else 
    { // if found render it
      console.log("foundList is not wmpty in app.get()");
      console.log("the length of foundList is " + (foundList ? 'not empty' : 'empty'));
      res.render("list.ejs", { listTitle: foundList.name , newListItems: foundList.itemsArray });
    }

   }

    catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  }
});


app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});


/* old app.post


app.post("/", function (req, res) {
  //request and response handles by the anonymous function on behalf of the app.post function for "/" page
 //whenever a data is filled and entered in any input field of a page  then what to do with that data is handled by the app.post
 //of that page
 
 //here it extracts the data entered from the req sent to the app.post method by the server in orde to make meaining from the request

  const item = req.body.newItem;//extracts the data

 const new_one = new itemModel( { name : item});
 //create a new document based on the itemModel model for the corresponding  collection and schema mentioned in the model

   new_one.save();
   res.redirect("/");

   //redirect to see the changes
});
*/