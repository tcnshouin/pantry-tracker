#include <iostream>

using namespace std;

int main() {
    char voter;
repeat:
    cout << "Enter your age: ";
    int age; cin >> age;

    if (age >= 18) {

        cout << "Are you a registered voter(Y/N): ";
        cin >> voter;

        switch (voter) {
            case 'Y': case 'y': cout << "You are a REGISTERED voter" << endl; break;
            case 'N': case 'n': cout << "You are NOT a registered voter!"<< endl; break;
            default: cout << "Invalid Input" << endl; break;
        }
    }
    else if (age < 18) {
        cout << "You are a minor"<< endl;
    }

    else{
    cout << "Invalid Input" << endl; goto repeat;
}

    return 0;
}