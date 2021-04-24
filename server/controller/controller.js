const  UploadModel = require('../model/schema');
const fs = require('fs');

exports.home = (req,res)=>{
    res.render('main');
}

exports.uploads = (req,res,next) =>{
    const files = req.files;

    if(!files){
        const error = new Error('Plz choose file');
        error.httpStatusCode= 400;
        return next(error)
    }

    let imgArray = files.map((file) => {
        let img = fs.readFileSync(file.path)

        return encode_image =  img.toString('base64')
    })

    let result = imgArray.map((src, index)=>{
        //create objetc to store data in the collection
        let finallmg ={
            filename: files[index].originalname,
            contentType:files[index].mimetype,
            imageBase64:src
        }

        let newUpload = new UploadModel(finallmg);

        return newUpload
        .save()
        .then(()=>{
            return {
                msg: `${files[index].originalname} Uploaded Successfully...!`
            }
        })
        .catch(error =>{
            if(error){
                if(error.name === 'MongoError' && error.code === 11000){
                    return Promise.reject({error: `Duplicate ${files[index].originalname}.File Already exists!`});
                }
                return Promise.reject({ error: error.message || `Cannot Upload ${file[index].originalname} Something Missing!`})
            }
        })
    });

    Promise.all(result)
        .then(msg =>{
            res.json(msg);
            // res.redirect('/')
        })
        .catch(err =>{
            res.json(err);
        })
}