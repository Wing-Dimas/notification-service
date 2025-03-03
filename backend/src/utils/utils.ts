import { AMQP_URL } from "@/config";
import { connect } from "amqplib";

export const getAMQPConnection = async (virtualHost: string) => {
  try {
    const connection = await connect(AMQP_URL + virtualHost);
    const channel = await connection.createChannel();

    return { connection, channel };
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== "number" && value === "") {
    return true;
  } else if (typeof value === "undefined" || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === "object" &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

export const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const color = (text: string, color: string) => {
  return !color
    ? text
    : color.startsWith("#")
    ? console.log(text)
    : console.log(text);
};
