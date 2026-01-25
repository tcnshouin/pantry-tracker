#include <iostream>

using namespace std;

int main() {

    cout << "***** Options: Tennessee(12), Kentucky(36), Louisianna(40,43), Exit(-1) *****" << endl;
    cout << endl;
    repeat:
    cout << "Enter a code: ";
    int code; cin >> code;

    switch (code) {
        case 12: cout << "Tennessee" << endl; goto repeat;
        case 36: cout << "Kentucky" << endl; goto repeat;
        case 40: case 43: cout << "Louisianna" << endl; goto repeat;
        case -1: cout << "Exit" << endl; break;
            default: cout << "Invalid Code" << endl; goto repeat;
    }



    return 0;
}