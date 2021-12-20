import { Channel } from './../../types/Channel';

const users: Channel[] = []

export function joinUser (id: string, userId: string, videoId: string) {
  users.push({id, userId, videoId})
  return {id, userId, videoId}
}

export function getCurrentUser (id: string) {
  return users.find(user => user.id === id)
}

export function userDisconnect (id: string) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  } else return
}