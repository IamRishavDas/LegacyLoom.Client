import URLS from "../endpoints/endpoints";

export const Register = async (username, email, password) => {
    const response = await fetch(`${URLS.REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
    });
    return response;
}

export const LoginUsingUsername = async (username, password) => {
  const response = await fetch(`${URLS.LOGIN_USERNAME}`,{
    method: "POST",
    headers: {
          "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password
    }),
  });
  return response;
}

export const LoginUsingEmail = async (email, password) => {
  const response = await fetch(`${URLS.LOGIN_EMAIL}`,{
    method: "POST",
    headers: {
          "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password
    }),
  });
  return response;
}

