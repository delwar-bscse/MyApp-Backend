// Creating token & save in cookie

const getToken = async(user, statusCode, res)=>{
    
    const token = await user.get_jwt_token();

    res.status(statusCode).json({
        success:true,
        token
    });
};

export default getToken;