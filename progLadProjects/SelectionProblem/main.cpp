#include <iostream>

using namespace std;
int main() {
    string color;
    int code;
repeat:
    cout << "Choose mode: \n";
    cout << "1 - Color input\n";
    cout << "2 - Number input\n";
    cout << "3 - Exit\n";
    cout << "Enter choice: ";
    char numsel; cin >> numsel;

    switch (numsel) {
        case '1':
            cout << "\nEnter traffic light color: ";
            cin >> color;

            if (color == "red" or color == "Red" or color == "RED") {
                cout << "STOP!"; break;
            }
            else if (color == "yellow" or color == "Yellow" or color == "YELLOW") {
                cout << "Get ready!"; break;
            }
            else if (color == "green" or color == "Green" or color == "GREEN") {
                cout << "GO!"; break;
            }
            else {
                cout << "Please Enter a Valid Input!\n\n"; goto repeat;
            }

        case '2':
            do {
                cout << "Enter Traffic Light Code (1 = Red, 2 = Yellow, 3 = Green): ";
                cin >> code;
            }while (code <= 0 or code >= 4);

                switch (code) {
                    case 1: cout << "STOP!\n\n"; break;
                    case 2: cout << "Get Ready!\n\n"; break;
                    case 3: cout << "GO!\n\n"; break;
                    default : cout << "Invalid input!"; goto repeat;
                }

        case '3': cout << "\nExiting..."; break;
        default: cout << "Invalid input!\n\n"; goto repeat;
    }

    return 0;
}