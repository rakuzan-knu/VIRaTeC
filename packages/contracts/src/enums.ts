export enum UserRole {
  STUDENT = 'STUDENT',
  RESEARCHER = 'RESEARCHER',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER',
}

export enum FacultyDivision {
  FIT = 'FIT', // Faculty of Information Technologies
  NNIF = 'NNIF', // Educational and Scientific Institute of Philology
  OTHER = 'OTHER',
}

export enum ProjectStatus {
  IDEA = 'IDEA',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum EventType {
  HACKATHON = 'HACKATHON',
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  MEETUP = 'MEETUP',
}

export enum StudyLevel {
  BACHELOR = 'BACHELOR',
  MASTER = 'MASTER',
  PHD = 'PHD',
  FACULTY = 'FACULTY',
  RESEARCHER = 'RESEARCHER',
  OTHER = 'OTHER',
}

export enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  MEMBERS = 'MEMBERS',
  PRIVATE = 'PRIVATE',
}

export enum PublicationType {
  PAPER = 'PAPER',
  NEWS = 'NEWS',
  EVENT = 'EVENT',
  MEDIA = 'MEDIA',
}

export enum SavedItemKind {
  PUBLICATION = 'PUBLICATION',
  PROJECT = 'PROJECT',
}

export enum OpenToOption {
  COIL_PROJECT = 'COIL_PROJECT',
  SEEKING_MENTOR = 'SEEKING_MENTOR',
  MENTORING = 'MENTORING',
  CO_AUTHORSHIP = 'CO_AUTHORSHIP',
  INTERNSHIP = 'INTERNSHIP',
}

export enum LanguageLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  NATIVE = 'NATIVE',
}

export enum StaffRole {
  NONE = 'NONE',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export enum AdminPermission {
  DASHBOARD_VIEW = 'DASHBOARD_VIEW',
  USERS_VIEW = 'USERS_VIEW',
  USERS_MANAGE = 'USERS_MANAGE',
  CONTENT_VIEW = 'CONTENT_VIEW',
  CONTENT_EDIT = 'CONTENT_EDIT',
  CONTENT_PUBLISH = 'CONTENT_PUBLISH',
  EVENTS_MANAGE = 'EVENTS_MANAGE',
  MEDIA_MANAGE = 'MEDIA_MANAGE',
  AUDIT_VIEW = 'AUDIT_VIEW',
}
