import { Tax } from "../models/taxRate";
import client from "../redis-client";
import { BadRequestError } from "@homestay.com/hms_common";
import { promisify } from "util";
import { taxDoc } from "../models/taxRate";

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const getTaxRate = async (cacheName: string): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    try {
      const redisCache = await getAsync(cacheName);
      if (redisCache) {
        resolve(JSON.parse(redisCache));
      } else {
        const tax = await Tax.findOne({ taxName: cacheName });
        if (tax) {
          await setAsync(cacheName, JSON.stringify(tax.taxRate), {
            EX: 60 * 60 * 24,
          });
          resolve(tax.taxRate);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

const setTaxRate = async (
  taxName: string,
  taxRate: number
): Promise<taxDoc> => {
  const tax = Tax.build({ taxName, taxRate });
  await tax.save();
  await setAsync(tax.taxName, tax.taxRate.toString(), "EX", 60 * 60 * 24);
  return tax;
};

const updateTaxRate = async (
  taxId: string,
  taxRate: number
): Promise<taxDoc> => {
  const tax = await Tax.findById(taxId);
  if (!tax) {
    throw new BadRequestError("Tax not found");
  }
  tax.set("taxRate", taxRate);
  await tax.save();
  await setAsync(tax.taxName, JSON.stringify(tax.taxRate), {
    EX: 60 * 60 * 24,
  });
  return tax;
};

export { getTaxRate, setTaxRate, updateTaxRate };
