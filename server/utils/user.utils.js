export function profileCompleteVerification(user) {
    let count = 0;
    count += user.name !== '' ? 20 : 0; 
    count += user.avatar !== '' ? 20 : 0; 
    count += user.about !== '' ? 20 : 0; 
    count += user.profile?.githubUrl || user.profile?.githubUrl !== '' ? 10 : 0; 
    count += user.profile?.linkedinUrl || user.profile?.linkedinUrl !== '' ? 20 : 0; 
    count += user.profile?.facebookUrl || user.profile?.facebookUrl !== '' ? 10 : 0; 

    return count;
}

// function isProfileCompletedSectionWise(user) {

// }

