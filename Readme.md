# Class Scheduler

__Live Demo: [class-scheduler.ianglen.me](https://class-scheduler.ianglen.me)__

A webapp to help with scheduling college courses.

![Screenshot](screenshot.jpg?raw=true)

## How to Use

1. Add the classes you plan to take as well as all the sections available for that class.
2. Click "Create Schedule"
3. Compare the possible schedules that were generated.

## FAQ

__It gives me an error about a scheduling conflict.__

This means that at least two of your classes have sections that always overlap. It is not possible to take both classes in the same semester. You can try seeing if there are other sections available that you didn't add, or you just need to delete one of the classes.


__Can I modify sections of classes that I've already added?__

No. Editing of classes hasn't been implemented yet. You need to delete the class and add it again with your changes.


__How do I change what buildings are available for classes?__

You'll need to edit the ```campusBuildings``` array in scripts.js. Change the building name and its GPS coordinates.


__My class has a lab/discussion/etc. where the sections available depend on the section selected for lecture. How do I enter that?__

There currently isn't anything implemented to handle sections based on sections of other classes. For now, only add one section for the lecture, then add all the available sections for the lab, or vice versa.

## License

The MIT License (MIT)
Copyright (c) 2016 Ian Glen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
