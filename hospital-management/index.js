require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB Connected");
})
.catch((err)=>{
    console.log("MongoDB Error:", err);
});


// =============================
// Patient Schema
// =============================

const patientSchema = new mongoose.Schema({

 fullName:{
  type:String,
  required:true
 },

 email:{
  type:String,
  required:true,
  unique:true
 },

 phone:{
  type:String,
  required:true
 },

 age:{
  type:Number,
  min:0
 },

 gender:String,

 disease:{
  type:String,
  required:true
 },

 doctorAssigned:{
  type:String,
  required:true
 },

 admissionDate:{
  type:Date,
  default:Date.now
 },

 roomNumber:String,

 patientType:String,

 // Status field
 status:{
  type:String,
  default:"Admitted"
 }

});

const Patient = mongoose.model("Patient", patientSchema);


// =============================
// POST → Register Patient
// =============================

app.post("/patients", async(req,res)=>{
 try{

  const patient = new Patient(req.body);

  const savedPatient = await patient.save();

  res.status(201).json(savedPatient);

 }catch(err){

  res.status(400).json({error:err.message});

 }
});


// =============================
// GET → All Patients
// =============================

app.get("/patients", async(req,res)=>{
 try{

  const patients = await Patient.find();

  res.status(200).json(patients);

 }catch(err){

  res.status(500).json({error:err.message});

 }
});


// =============================
// SEARCH → Patient by name/disease
// (IMPORTANT: id route से पहले होना चाहिए)
// =============================

// SEARCH → Patient by name or disease
app.get("/patients/search", async (req,res)=>{
 try{

  const name = req.query.name || "";
  const disease = req.query.disease || "";

  const patients = await Patient.find({
   $or:[
    { fullName:{ $regex:name , $options:"i" } },
    { disease:{ $regex:disease , $options:"i" } }
   ]
  });

  res.status(200).json(patients);

 }catch(err){

  res.status(500).json({error:err.message});

 }
});


// =============================
// GET → Single Patient
// =============================

app.get("/patients/:id", async(req,res)=>{
 try{

  const patient = await Patient.findById(req.params.id);

  if(!patient){
   return res.status(404).json({message:"Patient not found"});
  }

  res.status(200).json(patient);

 }catch(err){

  res.status(500).json({error:err.message});

 }
});


// =============================
// PUT → Update Patient
// =============================

app.put("/patients/:id", async(req,res)=>{
 try{

  const updatedPatient = await Patient.findByIdAndUpdate(
   req.params.id,
   req.body,
   {new:true}
  );

  if(!updatedPatient){
   return res.status(404).json({message:"Patient not found"});
  }

  res.status(200).json(updatedPatient);

 }catch(err){

  res.status(400).json({error:err.message});

 }
});


// =============================
// DELETE → Remove Patient
// =============================

app.delete("/patients/:id", async(req,res)=>{
 try{

  const deletedPatient = await Patient.findByIdAndDelete(req.params.id);

  if(!deletedPatient){
   return res.status(404).json({message:"Patient not found"});
  }

  res.status(200).json({
   message:"Patient deleted successfully",
   deletedPatient
  });

 }catch(err){

  res.status(500).json({error:err.message});

 }
});


// =============================
// Start Server
// =============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
 console.log("Server running on port " + PORT);
});