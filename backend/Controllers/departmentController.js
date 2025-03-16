const departmentModel = require("../Models/department");

const insertDepartment = async(req,res)=>{
    const {departmentShortName, departmentFullName} = req.body;
    const newDepartment = await new departmentModel({departmentShortName,departmentFullName});
    try{
        const response = await newDepartment.save();
        return res.status(200).json(response);

    }catch(err){
        if (!res.headersSent) {
            return res.status(500).json({ error: err.message });
        }
        console.error('Failed to send response:', err);
    }
}

const getDepartment = async(req,res)=>{
    try{
        const dept = await departmentModel.find();
        return res.status(200).json(dept);

    }catch(err){
        res.status(500).json({ error: err.message });
    }
}


module.exports={insertDepartment, getDepartment}
