export interface Course {
  is_favorite: boolean | undefined;
  id: number;
  name: string;
  description: string;
}

export interface Topic {
  id: number;
  name: string;
  courses: Course[];
}
