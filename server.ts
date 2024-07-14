import { createAdminRestApiClient } from '@shopify/admin-api-client';

import { promises as fs } from 'fs';

import axios from 'axios';

import { parse } from 'csv-parse';

import * as dotenv from 'dotenv';

dotenv.config();



const client = createAdminRestApiClient({
    storeDomain: 'feca2e-5d.myshopify.com',
    accessToken: process.env.ADMIN_API_KEY as string,
    apiVersion: "2024-07"
})

const query = async () => {

    try {
        const response = await client.get('products/9388274843938');
        try {
            const body = await response.json();
            //@ts-ignore
            //console.log(body.product);
        }
        catch (e) { //@ts-ignore
            console.log(e)
        }
    }
    catch (e) { //@ts-ignore
        console.log(e);
    }



}

//query();
//
const createProduct = async (e: any) => {
    let product = {
        title: e[0],
        product_type:'Print Book',
        variants: [
            {
                price: e[5],
                sku: e[2],
                barcode: e[2],
                inventory_quantity: e[4]
            }
        ]
    };
    try {
        const response = await client.post('products', { data: { product: product } });
    }
    catch (e) {
        console.log(e);
    }


}
//File must be in csv format - [Title, Author, ISBN, Cover Type, Quantity, Cost]
const readFile = async (filename:string) => {
    const records = <any>[];
    try {
        const content = await fs.readFile(filename);

        //console.log(content.length);

        const parser = parse(content);

        parser.on('readable', () => {
            let record;
            while ((record = parser.read()) !== null) {
                //@ts-ignore
                records.push(record);
            }
        });

        parser.on('error', (e) => { console.log(e) });
        //On a minute timer to comply with API limitations from Shopify
        parser.on('end', () => {
            const sleep = (milliseconds:number) =>{
                let times = records.length/40;
                let i = 0; 
                let j = 0;
                let limit = 40;
                var start = new Date().getTime();
                for(i; i < times; i++){
                    while(true){
                        if(i == 0){
                            break;
                        }
                        while((new Date().getTime() - start) < milliseconds){

                        }
                        break;
                    }
                    for(j; j < limit; j++){
                        createProduct(records[j]);
                    }

                    if(limit + 40 > records.length){
                        limit = records.length;
                    }else{
                        limit = limit + 40;
                    }
                    start = new Date().getTime();
                }
            
            }
            sleep(65000);
        });

    } catch (e) {
        console.log(e);
    }
    //return records;
}

//node server.js [filepath]
readFile(process.argv[2]);






