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

export const Logout = async () => {
  const response = await fetch(`${URLS.LOGOUT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
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

export const GetMyTimelines = async (authToken, paginationProperties) => {
  const response = await fetch(`${URLS.GET_MY_TIMELINES(paginationProperties.pageNumber, paginationProperties.pageSize, paginationProperties.orderBy)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const GetMyTimelineById = async (authToken, timelineId) => {
  const response = await fetch(`${URLS.GET_MY_TIMELINE_BY_ID(timelineId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const GetPublicFeed = async (authToken, paginationProperties) => {
  const response = await fetch(`${URLS.GET_PUBLIC_FEED(paginationProperties.pageNumber, paginationProperties.pageSize, paginationProperties.orderBy)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    }
  });
  return response;
}

export const GetPublicTimelineById = async (authToken, timelineId) => {
  const response = await fetch(`${URLS.GET_PUBLIC_TIMELINE(timelineId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const DeleteMyTimeline = async (authToken, id) => {
  const response = await fetch(`${URLS.DELETE_MY_TIMELINE(id)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    }
  });
  return response;
}

export const LikeTimeline = async (authToken, id) =>{
  const response = await fetch(`${URLS.LIKE_TIMELINE(id)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    }
  });
  return response;
}

export const DislikeTimeline = async (authToken, id) =>{
  const response = await fetch(`${URLS.DISLIKE_TIMELINE(id)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    }
  });
  return response;
}

export const CreateDraft = async (formData, authToken) => {
  const response = await fetch(`${URLS.SAVE_DRAFT}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
    // Don't set Content-Type header, let browser set it with boundary for FormData
  });
  return response;
}

export const GetMyDrafts = async (authToken, paginationProperties) => {
  const response = await fetch(`${URLS.GET_MY_DRAFTS(paginationProperties.pageNumber, paginationProperties.pageSize, paginationProperties.orderBy)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const GetMyDraftById = async (authToken, timelineId) => {
  const response = await fetch(`${URLS.GET_MY_DRAFT_BY_ID(timelineId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const DeleteDraft = async (authToken, id) => {
  const response = await fetch(`${URLS.DELETE_DRAFT(id)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      "Content-Type": "application/json",
    }
  });
  return response;
}

export const UpdateDraft = async (draftId, formData, authToken) => {
  const response = await fetch(`${URLS.UPDATE_DRAFT(draftId)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
    // Don't set Content-Type header, let browser set it with boundary for FormData
  });
  return response;
}
