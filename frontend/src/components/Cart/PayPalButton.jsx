import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider options={{ "client-id": "ASLo0PMZvjYqE-zvgMODqYnDlbuTwB6iR-LOidwKfX71OqnPuY2OoQr7VDZlRsxf14qspfvK6WlNB6Rd" }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount } }],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(onSuccess);
        }}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
