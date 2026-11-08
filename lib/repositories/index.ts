import { httpPropertyRepository } from "./http/property-repository.http";
import { httpProfileRepository } from "./http/profile-repository.http";
import { mockPropertyRepository } from "./mock/property-repository.mock";
import { mockProfileRepository } from "./mock/profile-repository.mock";

const useMocks = process.env.USE_MOCKS === "true";

export const propertyRepository = useMocks ? mockPropertyRepository : httpPropertyRepository;
export const profileRepository = useMocks ? mockProfileRepository : httpProfileRepository;