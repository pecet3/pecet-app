import { type User } from "@clerk/nextjs/server"

export const filterUserForClient = (user: User) => {
    if (!user || typeof user === "undefined") return
    return {
        id: user.id,
        username: user.username as string,
        profilePicture: user.profileImageUrl,
        description: user.publicMetadata.description as string,
        backgroundImg: user.publicMetadata.backgroundImg as string
    }
} 