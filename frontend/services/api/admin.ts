import { institutionApi, collegeApi, departmentApi } from './institutions';
import { venueApi } from './venues';
import { coursesApi as baseCoursesApi } from './courses';

export { institutionApi, collegeApi, departmentApi };

export const venuesApi = {
  ...venueApi,
  createVenue: venueApi.create,
  updateVenue: venueApi.update,
  deleteVenue: venueApi.delete,
};

export const coursesApi = baseCoursesApi;
