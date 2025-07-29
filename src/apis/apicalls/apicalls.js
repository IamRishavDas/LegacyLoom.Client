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

export const CreateTimeline = async (formData, authToken) => {
  const response = await fetch(`${URLS.CREATE_TIMELINE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
    // Don't set Content-Type header, let browser set it with boundary for FormData
  });
  return response;
}

