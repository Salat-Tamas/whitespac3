import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { useState } from "react"
import { Topic } from '@/types/course';
import toast from "react-hot-toast"

interface CreateCourseModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onCourseCreate: (course: { name: string; description: string; topic_id: number }) => void;
    topics: Topic[];
}

export function CreateCourseModal({ open, setOpen, onCourseCreate, topics }: CreateCourseModalProps) {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [topicId, setTopicId] = useState<string>("");

    const handleSubmit = () => {
        if (name === "" || description === "" || !topicId) {
            toast.error("Please fill in all fields.", {
                position: "top-center"
            });
            return;
        }

        console.log("Form Data:", {
            name,
            description,
            topic_id: parseInt(topicId)
        });
        
        console.log("Selected Topic:", topics.find(topic => topic.id === parseInt(topicId)));
        
        onCourseCreate({ 
            name, 
            description, 
            topic_id: parseInt(topicId)
        });
        
        setOpen(false);
        setName("");
        setDescription("");
        setTopicId("");
        console.log("onCourseCreate function:", onCourseCreate);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>Add a new course to the library.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="topic" className="text-right">Topic</Label>
                        <Select 
                            value={topicId} 
                            onValueChange={setTopicId}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map((topic) => (
                                    <SelectItem key={topic.id} value={topic.id.toString()}>
                                        {topic.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="description"
                            type="text"
                            className="col-span-3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSubmit}>Create Course</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}