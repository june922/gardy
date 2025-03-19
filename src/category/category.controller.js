const category = require('./category.model');

//get all permission types
const getAllCategory= async (req, res) => {

  try {
      const getCategory= await category.query();

      res.status(200).json(getCategory);

  } catch (error) {
      return res.status(500).send({
          message: "internal server error."
      });
  }
}

module.exports = {
  getAllCategory
}