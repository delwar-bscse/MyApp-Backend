class ProductFeatures{
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    };


    // Searching product by name;
    search(){
        // console.log(this.queryStr);
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex: this.queryStr.keyword,
                $options: "i"
            }
        } : {};

        // console.log({...keyword});
        
        this.query.find({...keyword});
        // console.log(this);

        return this;
    };


    // Filter by Price & Rating;
    filter(){
        const queryCopy = {...this.queryStr};
        // console.log(queryCopy);

        // Removing some fields for category
        const removeFields = ["keyword","page"];
        removeFields.forEach(key=>delete queryCopy[key]);

        //Filter for Price and Rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key=>`$${key}`);

        queryStr = JSON.parse(queryStr);
        // console.log(queryStr);

        this.query = this.query.find(queryStr);
        return this;
    };

    
    // Pagination page
    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage - 1);

        // console.log(skip, currentPage);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    };
};

export default ProductFeatures;