#include <iostream>
#include <cctype>

using namespace std;

int main() {

    cout << "Enter a Number: ";
    char ch; cin >> ch;

    int chcon = static_cast<int>(isdigit(ch));

    if (chcon > 0) {
        cout << "DIGIT";
    }

    else {
        cout << "NOT A DIGIT";
    }


    return 0;
}