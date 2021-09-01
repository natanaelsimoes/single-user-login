module.exports = {
    "env": {
        "node": true,
        "jest": true,
        "es2020": true
    },
    "extends": [
        "eslint:recommended",
        "airbnb-base",
        "plugin:import/recommended"
    ],
    "parser": "babel-eslint",
    "rules": {
        "class-methods-use-this": "off",
        "no-underscore-dangle": "off",
        "no-plusplus": "off",
        "no-param-reassign": "off",
        "no-throw-literal": "off",
        "no-console": "off",
        "no-await-in-loop": "off",
        "import/no-cycle": "off",
        "no-restricted-syntax": "off",
    }
};