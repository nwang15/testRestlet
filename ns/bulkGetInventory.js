const {CONSUMER_KEY,CONSUMER_SECRET,ACCOUNT_ID,ACCESS_TOKEN,TOKEN_SECRET,URL} = require('../config');
const {nsRequest} = require('./nsRequest');
//convert data to data for shopify request
function buildVariantData(variantData){
    return [];
}
//make request based off variant sku/item code
function getVariantQuantity(variants,variantIndex,variantData){
    if(!variantIndex){
        variantIndex = 0;
    }
    if(!variantData){
        variantData = [];
    }
    let promise = new Promise((resolve,reject) => {
        const authInfo = {
            consumer_key:CONSUMER_KEY,
            consumer_secret:CONSUMER_SECRET,
            access_token:ACCESS_TOKEN,
            token_secret:TOKEN_SECRET,
            realm:ACCOUNT_ID
        };
        let currentVariant = variants[variantIndex];
        let reqData = {
            item:currentVariant.sku
        };
        console.log('getting data for: ',currentVariant.sku);
        return nsRequest(authInfo,URL,'get-quantity','post',reqData)

        .then(quantity => {
            console.log('variant quantity: ',quantity);
            variantData.push({
                variant_id: currentVariant.id,
                inventory_quantity:quantity   
            });

            if(variantIndex < variantData.length && variantIndex + 1 !== variantData.length){
                resolve(getVariantQuantity(variants,variantIndex + 1,variantData));
            }
            else{
                resolve(variantData);
            }
        })

        .catch(err => {
            console.log('error getting variant quantity: ',err);
            reject(err);
        })
    });

    return promise;
}

function GetInventoryData(productData,productIndex,data){
    if(!productIndex){
        productIndex = 0;
    }
    if(!data){
        data = [];
    }

    let promise = new Promise((resolve,reject) => {
        let currentProduct = productData[productIndex];
        let product = {};
        product.id = currentProduct.id;
        console.log('=================get data for: ',currentProduct.title);
        return getVariantQuantity(currentProduct.variants)

        .then(variantData => {
            const variants = buildVariantData(variantData);
            if(productIndex < productData.length && productIndex + 1 !== productData.length){
                product.variants = variants;
                data.push(product);
                resolve(GetInventoryData(productData,productIndex + 1,data));
            }
            else{
                resolve(data);
            }
        })

        .catch(err => {
            reject(err);
        })

    });

    return promise;
}

module.exports = {GetInventoryData};