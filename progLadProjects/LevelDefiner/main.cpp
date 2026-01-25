#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "Enter your Level: ";
    char lvl; cin >> lvl;

    switch (lvl) {
        case '1': cout << "Freshmen" << endl; break;
            case '2': cout << "Sophmore" << endl; break;
            case '3': cout << "Junior" << endl; break;
            case '4': cout << "Senior" << endl; break;
        default:  cout << "undefined" << endl; break;
    }
    return 0;
}
