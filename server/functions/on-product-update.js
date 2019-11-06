'use strict';

module.exports.handler = async (event, context, callback) => {
  console.log(event);
  callback(null, { body: JSON.stringify(event) });
};
