#include <iostream>
using namespace std;

int main() {
    int choice;

    do {
        cout << "\nMenu:\n";
        cout << "1. Say Hello\n";
        cout << "2. Say Goodbye\n";
        cout << "3. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1: cout << "Hello there!" << endl; break;
            case 2: cout << "Goodbye!" << endl; break;
            case 3: cout << "Exiting program..." << endl; break;
            default: cout << "Invalid choice!" << endl;
        }
    } while (choice != 3);

    return 0;
}
