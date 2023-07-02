import { type User } from "@clerk/nextjs/server"

export const filterUserForClient = (user: User) => {
    return { id: user.id, username: user.username, profilePicture: user.profileImageUrl, description: user.publicMetadata.description as string }
}