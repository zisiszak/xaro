import { userRepository } from '../repositories/user.repository.js';

export const isUsernameTaken = userRepository.isUsernameTaken;
