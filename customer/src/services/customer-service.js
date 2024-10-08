const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require("../utils");
const { APIError, BadRequestError } = require("../utils/app-errors");

// All Business logic will be here
class CustomerService {
  constructor() {
    this.repository = new CustomerRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    try {
      const existingCustomer = await this.repository.FindCustomer({ email });

      if (existingCustomer) {
        const validPassword = await ValidatePassword(password, existingCustomer.password);

        if (validPassword) {
          const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id });
          return FormateData({ id: existingCustomer._id, token });
        }
      }
      return FormateData(null);
    } catch (err) {
      throw new BadRequestError("Body invalid form", err);
    }
  }

  async SignUp(userInputs) {
    const { email, password, phone } = userInputs;

    try {
      // creates salt
      let salt = await GenerateSalt();

      let userPassword = await GeneratePassword(password, salt);

      const existingCustomer = await this.repository.CreateCustomer({ email, password: userPassword, phone });

      const token = await GenerateSignature({ email: email, _id: existingCustomer._id });

      return FormateData({ id: existingCustomer._id, token });
    } catch (err) {
      throw new BadRequestError("Body invalid form", err);
    }
  }

  async AddNewAddress(_id, userInputs) {
    const { street, postalCode, city, country } = userInputs;

    try {
      const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city, country });
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetProfile(id) {
    try {
      const existingCustomer = await this.repository.FindCustomerById({ id });
      return FormateData(existingCustomer);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetShoppingDetails(id) {
    try {
      const existingCustomer = await this.repository.FindCustomerById({ id });

      if (existingCustomer) {
        return FormateData(existingCustomer);
      }
      return FormateData({ msg: "Error" });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetWishList(customerId) {
    try {
      const wishListItems = await this.repository.Wishlist(customerId);
      return FormateData(wishListItems);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async AddToWishlist(customerId, product) {
    try {
      const wishlistResult = await this.repository.AddWishlistItem(customerId, product);
      return FormateData(wishlistResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async ManageCart(customerId, product, qty, isRemove) {
    try {
      const cartResult = await this.repository.AddCartItem(customerId, product, qty, isRemove);
      return FormateData(cartResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async ManageOrder(customerId, order) {
    try {
      const orderResult = await this.repository.AddOrderToProfile(customerId, order);
      return FormateData(orderResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  // other services will be communicates with this service from here via Message Brokers
  async SubscribeEvents(payload) {
    const { event, data } = payload;

    const { _id, product, order, qty } = data;

    switch (event) {
      case "ADD_TO_WISHLIST":        
        return this.AddToWishlist(_id, product);
      case "ADD_TO_CART":
        return this.ManageCart(_id, product, qty, false);
      case "REMOVE_FROM_CART":
        return this.ManageCart(_id, product, qty, true);
      case "CREATE_ORDER":
        return this.ManageOrder(_id, order);
      case "GET_SHOPPING_DETAILS":
        return this.GetShoppingDetails(_id);
      default:
        break;
    }
  }
}

module.exports = CustomerService;
