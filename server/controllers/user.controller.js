import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'


export async function createUser(request,response){
    try{
        const {name,email,password} = request.body
        if(!name || !email || !password){
            return response.status(400).json({
                message :"Invalid inputs",
                error : true,
                success: false
            })
        }
        const user= await userModel.findOne({email})
        if(!user){
            return response.status(400).json({
                message :"User already exists",
                error : true,
                success: false
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword= await bcrypt.hash(password,salt)
        const newUser= {
            name,email,password:hashPassword
        }
        const save = await (new userModel(newUser)).save() 
        
        
        
        return response.json({
            message :"SignUp successful"
            ,error:false,
            success: true
        })
    }
    catch(error){
        return response.status(500).json({
            message : error.status || error,
            error: true,
            success: false
        })
    }
}