#include <iostream>
#include <string>

using namespace std;

int main() {

    int code;

    repeat:
    cout << "Enter a code: ";
    cin >> code;

    if (code == 12) {
        cout << "\nTennessee";
    }

    else if (code == 36) {
        cout << "\nKentucky";
    }

    else if (code == 40 || code == 43) {
        cout << "\nLousiana";
    }

    else if (code == -1) {
        cout << "\nExit";
    }

    else {
        cout << "\nInvalid Code";
        cout << "\n";
        goto repeat;
    }



    return 0;
}