function convertData(shopifyData){
    let nsData = {};
    nsData.order = buildOrderData(shopifyData);
    nsData.customer = buildCustomerData(shopifyData);
    console.log('convert data',shopifyData.tax_lines);
    return nsData;
}

function buildExtraTaxLine(taxData){
    let taxLine = {};
    taxLine.item = 'MISC - Account 25500 - 5% GST',
    taxLine.quantity = 1;
    taxLine.price = "";
    taxLine.rate = taxData.price;
    return taxLine;
}

//build line item arr for order
function buildLineItemArr(lineItems){
    let nsItems = [];
    //console.log('shopify line items: ',lineItems);
    for (let i = 0; i < lineItems.length; i++) {
        const shopifyItem = lineItems[i];
        if(!shopifyItem.sku){
            continue;
        }
        let singleItem = {};
        //need to match up shopify item codes with netsuite 
        singleItem.item = shopifyItem.sku;
        singleItem.quantity = shopifyItem.quantity;
        //for now hard coded this will = online price
        //discuss if NS should handle pricing or take pricing from Shopify
        singleItem.price = 5;
        //individual product price
        singleItem.rate = shopifyItem.price;
        nsItems.push(singleItem);
    }
    //console.log('Item array: ',nsItems);
    return nsItems;
}

function buildOrderData(shopifyData){
    let orderData = {};

    orderData.recordtype = 'salesorder';
    orderData.email = shopifyData.email;
    orderData.memo = 'Shopify - Web Order';
    orderData.shippingaddress = buildAddressBook(shopifyData.shipping_address);
    //get shopify shipping code will need to test out with real orders
    orderData.shipmethod = shopifyData.shipping_lines[0].code ? shopifyData.shipping_lines[0].code : "No Shipping";
    orderData.shippingcost = shopifyData.shipping_lines[0].price_set.shop_money.amount;
    orderData.billingaddress = buildAddressBook(shopifyData.billing_address);
    orderData.otherrefnum = shopifyData.name;
    orderData.items = buildLineItemArr(shopifyData.line_items);
    let taxData = shopifyData.tax_lines.filter(taxLine => taxLine.title !== 'GST' && taxLine.title !== 'HST');
    if(taxData.length > 0){
        taxData = taxData[0];
        orderData.items.push(buildExtraTaxLine(taxData));
        orderData.memo += ` extra tax charged: ${taxData.title} at a rate of: ${Math.round(taxData.rate * 100)}%`;
    }
    orderData.extraData = {
        taxProvince:shopifyData.shipping_address.province ? shopifyData.shipping_address.province : "no province or state"
    };
    orderData.paymentmethod = "";
    return orderData;
}

function buildAddressBook(addressData){
    let addressbook = {};
    
    addressbook.country = addressData.country_code;
    addressbook.city = addressData.city;
    addressbook.state = addressData.province ? addressData.province : "no province";
    addressbook.addr1 = addressData.address1;
    if(addressData.address2){
        addressbook.addr2 = addressData.address2;  
    }
    addressbook.attention = addressData.name;
    addressbook.addressee = addressData.name;
    addressbook.zip = addressData.zip;

    return addressbook;
}


function buildCustomerData(shopifyData){
    let customerData = {};

    customerData.recordtype = 'customer';
    customerData.email = shopifyData.email;
    customerData.isperson = 'T';
    customerData.firstname = shopifyData.shipping_address.first_name;
    customerData.lastname = shopifyData.shipping_address.last_name;
    //for now hard coded since it is required by NS 2 = retail 5 = online price
    customerData.category = 2;
    customerData.pricelevel = 5;
    customerData.addressbook = buildAddressBook(shopifyData.shipping_address);
    
    return customerData;
}

module.exports = {convertData};