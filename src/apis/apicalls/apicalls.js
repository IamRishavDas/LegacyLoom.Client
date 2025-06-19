import URLS from "../endpoints/endpoints";

export const Login = async (username, email, password) => {
    const response = await fetch(`${URLS.LOGIN}`, {
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

