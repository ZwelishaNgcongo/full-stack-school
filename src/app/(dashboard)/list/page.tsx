export default function ListDashboard() {
  return (
    <div className="bg-white p-6 rounded-md">
      <h1 className="text-xl font-semibold mb-4">Lists</h1>
      <p className="text-gray-500 mb-6">
        Manage your school data - students, teachers, classes, and more.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          href="/list/students"
          className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <h3 className="font-semibold text-blue-900">Students</h3>
          <p className="text-blue-700 text-sm">Manage student records</p>
        </a>
        
        <a
          href="/list/teachers"
          className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <h3 className="font-semibold text-green-900">Teachers</h3>
          <p className="text-green-700 text-sm">Manage teacher records</p>
        </a>
        
        <a
          href="/list/parents"
          className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <h3 className="font-semibold text-purple-900">Parents</h3>
          <p className="text-purple-700 text-sm">Manage parent records</p>
        </a>
        
        <a
          href="/list/classes"
          className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <h3 className="font-semibold text-yellow-900">Classes</h3>
          <p className="text-yellow-700 text-sm">Manage class schedules</p>
        </a>
        
        <a
          href="/list/subjects"
          className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <h3 className="font-semibold text-red-900">Subjects</h3>
          <p className="text-red-700 text-sm">Manage subjects</p>
        </a>
        
        <a
          href="/list/assignments"
          className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <h3 className="font-semibold text-indigo-900">Assignments</h3>
          <p className="text-indigo-700 text-sm">Manage assignments</p>
        </a>
        
        <a
          href="/list/exams"
          className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
        >
          <h3 className="font-semibold text-pink-900">Exams</h3>
          <p className="text-pink-700 text-sm">Manage exams</p>
        </a>
        
        <a
          href="/list/results"
          className="p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <h3 className="font-semibold text-teal-900">Results</h3>
          <p className="text-teal-700 text-sm">View exam results</p>
        </a>
        
        <a
          href="/list/events"
          className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <h3 className="font-semibold text-orange-900">Events</h3>
          <p className="text-orange-700 text-sm">Manage school events</p>
        </a>
      </div>
    </div>
  );
}
