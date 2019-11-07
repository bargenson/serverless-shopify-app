'use strict';

module.exports.handler = async (event, context) => {
  console.log(event);
  return { body: JSON.stringify(event) };
};
