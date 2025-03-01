export interface Course {
  id: number;
  name: string;
  description: string;
}

export interface Topic {
  id: number;
  name: string;
  courses: Course[];
}
